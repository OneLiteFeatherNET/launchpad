<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AuthorCard from '~/components/common/AuthorCard.vue';

const props = defineProps({
  authors: {
    type: Array,
    required: true
  }
});

const { locale } = useI18n();
const resolvedAuthors = ref([]);
const isLoading = ref(true);

// Function to fetch all authors data at once
const fetchAllAuthorsData = async (authorRefs) => {
  try {
    // Extract unique namespace-key pairs to query
    const authorQueries = authorRefs
      .filter(ref => ref.namespace && ref.key)
      .map(ref => ({
        namespace: ref.namespace,
        key: ref.key,
        originalRef: ref // Keep reference to the original author object
      }));

    // If no valid author references, return empty array
    if (authorQueries.length === 0) {
      return [];
    }

    // Prepare collections based on locale
    const authorCollection = locale.value === 'de' ? 'authors_de' : 'authors_en';
    const teamCollection = locale.value === 'de' ? 'team_de' : 'team_en';

    // Create a map to store resolved authors
    const resolvedAuthorsMap = new Map();

    // Step 1: Fetch all authors from the authors collection
    const authorQueryConditions = authorQueries.map(q => ({ namespace: q.namespace, key: q.key }));
    const authorsResult = await queryCollection(authorCollection)
      .where(author => authorQueryConditions.some(
        condition => author.namespace === condition.namespace && author.key === condition.key
      ))
      .find();

    // Map authors by namespace:key for easy lookup
    const authorsMap = new Map();
    authorsResult.forEach(author => {
      const key = `${author.namespace}:${author.key}`;
      authorsMap.set(key, author);
    });

    // Step 2: Fetch team data (only once)
    let teamMembers = [];
    try {
      const teamData = await queryCollection(teamCollection).first();
      if (teamData && teamData.ranks) {
        teamMembers = teamData.ranks.flatMap(rank => rank.members) || [];
      }
    } catch (teamError) {
      console.error('Error fetching team data:', teamError);
    }

    // Step 3: Process each author query
    for (const query of authorQueries) {
      const { namespace, key, originalRef } = query;
      const lookupKey = `${namespace}:${key}`;

      // Check if author was found in authors collection
      if (authorsMap.has(lookupKey)) {
        const author = authorsMap.get(lookupKey);
        resolvedAuthorsMap.set(lookupKey, {
          ...author,
          slug: originalRef.slug || author.slug
        });
        continue;
      }

      // Check if author is in team members
      const teamMember = teamMembers.find(
        member => member.namespace === namespace && member.key === key
      );

      if (teamMember) {
        resolvedAuthorsMap.set(lookupKey, {
          ...teamMember,
          slug: originalRef.slug || teamMember.slug
        });
        continue;
      }

      // If not found anywhere, use placeholder
      resolvedAuthorsMap.set(lookupKey, {
        name: lookupKey,
        namespace,
        key,
        slug: originalRef.slug
      });
    }

    // Convert map to array in the same order as original queries
    return authorQueries.map(query => {
      const lookupKey = `${query.namespace}:${query.key}`;
      return resolvedAuthorsMap.get(lookupKey);
    });
  } catch (error) {
    console.error('Error fetching authors data:', error);
    // Return placeholders for all authors on error
    return authorRefs.map(ref => {
      if (ref.namespace && ref.key) {
        return {
          name: `${ref.namespace}:${ref.key}`,
          namespace: ref.namespace,
          key: ref.key,
          slug: ref.slug
        };
      }
      return ref;
    });
  }
};

// Resolve all author references
onMounted(async () => {
  try {
    // Separate author references from full author objects
    const authorRefs = props.authors.filter(author => author.namespace && author.key);
    const fullAuthors = props.authors.filter(author => !author.namespace || !author.key);

    // Fetch data for author references
    const resolvedAuthorRefs = await fetchAllAuthorsData(authorRefs);

    // Combine resolved references with full author objects
    resolvedAuthors.value = [...resolvedAuthorRefs, ...fullAuthors];
  } catch (error) {
    console.error('Error resolving author references:', error);
    // Fallback to original authors array
    resolvedAuthors.value = props.authors;
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <section 
    class="py-12 px-4 sm:px-6 lg:px-8 bg-surface-variant dark:bg-surface-variant-dark"
    aria-labelledby="project-authors-heading"
  >
    <div class="max-w-7xl mx-auto">
      <h2 
        id="project-authors-heading" 
        class="text-2xl font-bold text-on-surface-variant dark:text-on-surface-variant-dark mb-8"
      >
        {{ $t('projects.authors') }}
      </h2>

      <!-- Loading state -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary dark:border-primary-dark"></div>
      </div>

      <!-- Authors grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AuthorCard
          v-for="(author, index) in resolvedAuthors"
          :key="author.slug || index"
          :author="author"
          display-mode="card"
          :show-role="true"
          :show-view-profile="true"
        />
      </div>
    </div>
  </section>
</template>
