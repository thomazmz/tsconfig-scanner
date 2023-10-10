import { SonarMetrics } from 'sonar'
import { GitRepository } from './git'
import { createStringJson } from './utils'
import * as path from 'path'
import * as fs from 'fs'

export const OUTPUT_DIRECTORY = '.output'

export const CODE_DIRECTORY = '.code'

export const METADATA_OUTPUT_FILE_NAME = 'repository.json'

export const SONAR_PROPERTIES_OUTPUT_FILE_NAME = 'sonar.properties'

export const SONAR_METRICS_OUTPUT_FILE_NAME = 'sonar.metrics'

export const SONAR_LOGS_OUTPUT_FILE_NAME = 'sonar.logs'

export const TSCONFIG_PROPERTIES_FILE_NAME = 'typescript.config'

export const TSCONFIG_OPTIONS_FILE_NAME = 'typescript.options'

export function existOutputDirectory(repository: GitRepository): boolean {
  const repositoryOutputDirectoryPath = resolveOutputDirectoryPath(repository)
  return fs.existsSync(repositoryOutputDirectoryPath)
}

export function createOutputFile(repository: GitRepository, content: string, fileName: string): void {
  const repositoryOutputDirectoryPath = resolveOutputDirectoryPath(repository)
  fs.mkdirSync(repositoryOutputDirectoryPath, { recursive: true})

  const repositoryOutputFilePath = resolveOutputFilePath(repository, fileName)
  fs.writeFileSync(repositoryOutputFilePath, content, {encoding:'utf8',flag:'w'})
}

export function resolveOutputFilePath(repository: GitRepository, fileName: string): string {
  const OutputDirectoryPath = resolveOutputDirectoryPath(repository)
  return path.join(OutputDirectoryPath, fileName)
}

export function resolveOutputDirectoryPath(repository: GitRepository): string {
  return path.join(OUTPUT_DIRECTORY, repository.hash)
}

export function createMetadataFile(repository: GitRepository): void {
  createOutputFile(repository, createStringJson(repository), METADATA_OUTPUT_FILE_NAME)
}

export function createSonarPropertiesFile(repository: GitRepository, content: string): void {
  createOutputFile(repository, content, SONAR_PROPERTIES_OUTPUT_FILE_NAME)
}

export function createSonarLogsFile(repository: GitRepository, content: string): void {
  createOutputFile(repository, content, SONAR_LOGS_OUTPUT_FILE_NAME)
}

export function createSonarMetricsFile(repository: GitRepository, metrics: SonarMetrics): void {
  createOutputFile(repository, createStringJson(metrics), SONAR_METRICS_OUTPUT_FILE_NAME)
}

export function createTypescriptConfigFile(repository: GitRepository, content: any): void {
  createOutputFile(repository, createStringJson(content), TSCONFIG_PROPERTIES_FILE_NAME)
}

export function createTypescriptOptionsFile(repository: GitRepository, content: any): void {
  createOutputFile(repository, createStringJson(content), TSCONFIG_OPTIONS_FILE_NAME)
}