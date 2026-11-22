export type CollectiveResponse = {
  balance?: number
  backersCount?: number
  yearlyIncome?: number
  updatedAt?: string
  lastTransactionAt?: string
  currency?: string
}

export type CollectiveStats = {
  slug: string
  currency: string
  totalRaised: number
  goal: number
  contributors: number | null
  updatedAt: string
  link: string
}

/** The source did not answer usefully; carries no numbers so none can be shown by mistake. */
export type CollectiveUnavailable = {
  available: false
  slug: string
  link: string
}

export type CollectiveResult = (CollectiveStats & { available: true }) | CollectiveUnavailable

/** A Lite supporter as the public member list names them; nothing else is exposed. */
export type LiteSupporter = {
  name: string
  image: string | null
  profile: string
}
