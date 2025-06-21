declare module 'virtual:contributors' {
  export interface ContributorInfo {
    name: string
    email: string
    count: number
    hash: string
  }

  const contributorsData: Record<string, ContributorInfo[]>
  export default contributorsData
} 