import { GitRepository } from './git'
import * as shelljs from 'shelljs'
import * as code from './code'

export function executeRepositoryCommand(repository: GitRepository, command: string): string {
  const repositoryCodePath = code.resolveCodeDirectoryPath(repository)

  const shellRoot = shelljs.pwd()

  shelljs.cd(repositoryCodePath)

  const shellOutput = executeCommand(command)

  shelljs.cd(shellRoot)

  return shellOutput
}

export function executeCommand(command:string): string {
  return shelljs.exec(command, { silent: true }).stdout
}