import * as shell from './shell'
import * as code from './code'

export type GitRepository = {
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly pushedAt: Date
  readonly providerId: string
  readonly provider: string
  readonly hash: string
  readonly name: string
  readonly fullName: string
  readonly apiUrl: string
  readonly gitUrl: string
  readonly isTemplate: boolean
  readonly isPrivate: boolean
  readonly isFork: boolean
  readonly forks: number
  readonly issues: number
  readonly stars: number
  readonly watchers: number
  readonly language: string
}

export function cloneRepository(repository: GitRepository): string  {
  const path = code.resolveCodeDirectoryPath(repository)
  const command = `git clone ${repository.gitUrl} ${path}`
  return shell.executeCommand(command)
}
