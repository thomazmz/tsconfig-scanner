import { GitRepository } from './git'
import * as typescript from './typescript'
import * as github from './github'
import * as output from './output'
import * as sonar from './sonar'
import * as code from './code'
import * as git from './git'
import * as db from './db'

const START_DATE = new Date('04/01/2023')
const END_DATE = new Date('05/25/2023')

function print(message?: string, repository?: GitRepository) {
  let line = `${(new Date()).toISOString()} | `

  if(repository) {
    line = line + `${repository.fullName} | `
  }

  if(message) {
    line = line + message
  }

  console.log(line)
}

async function collectRepositoryAnalysis(repository: GitRepository): Promise<void> {

  const startTime = performance.now();

  function getExecutionTime() {
    return Math.trunc(performance.now() - startTime)
  }

  if(output.existOutputDirectory(repository)) {
    print('project analysis output already exists', repository)
    print('stoping project analysis', repository)
    print(`execution time: ${getExecutionTime()}ms`, repository)
    return
  }

  print('saving repository metadata', repository)
  output.createMetadataFile(repository)

  print('cloning Git repository', repository)
  git.cloneRepository(repository)

  print('collecting TypeScript metadata', repository)
  const { count, paths } = typescript.collectTypescriptMetadata(repository)

  if(!paths[0] || count < 1) {
    print('project does not contain tsconfig files', repository)
    print('stoping project analysis', repository)
    print(`execution time: ${getExecutionTime()}ms`, repository)
    code.dropCodeDirectory(repository)
    return
  }

  if(count > 1) {
    print('project contain too many tsconfig files', repository)
    print('stoping project analysis', repository)
    print(`execution time: ${getExecutionTime()}ms`, repository)
    code.dropCodeDirectory(repository)
    return
  }

  typescript.collectTypescriptConfigFile(repository, paths[0])
  
  const typescriptOptions = typescript.collectTypescriptOptions(repository, paths[0])

  print('collecting SonarQube metadata', repository)
  const sonarMetrics = await sonar.collectSonarMetrics(repository)

  print('saving project analysis in MongoDB', repository)
  await db.saveRepositoryDocument({...repository,
    sonarMetrics,
    typescriptOptions,
  })

  print('project analysis is finished', repository)
  print(`execution time: ${getExecutionTime()}ms`, repository)
  code.dropCodeDirectory(repository)
  return
}

async function collectGithubAnalysis(startDate: Date, endDate: Date, projectIndex = 1) {

  if(endDate.getTime() >= startDate.getTime()) {

    const repositories = await github.getRepositories(endDate)

    print(`analysing ${repositories.length} repositories from ${endDate.toLocaleDateString('en-GB')}`)

    for (let index = 0; index < repositories.length; index++) {

      const repository = repositories[index]

      if(!repository) {
        continue
      }

      print()
      print(`started project analysis #${projectIndex++}`, repository)
      print(repository.hash, repository)

      await collectRepositoryAnalysis(repository).catch(error => {
        console.log(error)
      })
    }

    print()

    const nextEndDate = new Date(endDate.getTime() - 86400000)

    return collectGithubAnalysis(startDate, nextEndDate, projectIndex++)
  }
}

async function run() {
  await db.connect()
  await collectGithubAnalysis(START_DATE, END_DATE)
  await db.disconnect()
}

run()