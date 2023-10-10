import { GitRepository } from './git'
import * as glob from 'glob'
import * as path from 'path'
import * as fs from 'fs'

export const OUTPUT_DIRECTORY = '.output'

export const CODE_DIRECTORY = '.code'

export function dropCodeDirectory(repository: GitRepository): void {
  const repositoryCodeDirectoryPath = resolveCodeDirectoryPath(repository)
  fs.rmSync(repositoryCodeDirectoryPath, { recursive: true })
}

export function createCodeFile(repository: GitRepository, content: string, filePath: string): void {
  const repositoryCodeDirectoryPath = resolveCodeDirectoryPath(repository)
  fs.mkdirSync(repositoryCodeDirectoryPath, { recursive: true})

  const repositoryCodePath = resolveCodeFilePath(repository, filePath)
  fs.writeFileSync(repositoryCodePath, content, {encoding:'utf8',flag:'w'})
}

export function resolveCodeFilePath(repository: GitRepository,  fileName: string): string {
  const codeDirectoryPath = resolveCodeDirectoryPath(repository)
  return path.join(codeDirectoryPath, fileName)
}

export function resolveCodeDirectoryPath(repository: GitRepository): string {
  return path.join(CODE_DIRECTORY, repository.hash)
}

export function resolveCodeGlobPaths(repository: GitRepository, globPattern: string): string[] {
  const repositoryCodePath = resolveCodeDirectoryPath(repository)
  const repositoryGlobPath = path.join(repositoryCodePath, globPattern)
  return glob.globSync(repositoryGlobPath)
}
