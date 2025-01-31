import { GeneratedFolder, GeneratedFile } from '@viasoft/teleport-types'

export const convertToCodesandboxStructure = (
  folder: GeneratedFolder,
  prefix: string = ''
): Record<string, CodesandboxFile> => {
  const folderFiles = folder.files.reduce((acc: Record<string, CodesandboxFile>, file) => {
    const fileKey = prefix + file.name + (file.fileType ? `.${file.fileType}` : '')
    const fileValue = getCodeSandboxFile(file)
    acc[fileKey] = fileValue
    return acc
  }, {})

  return folder.subFolders.reduce((acc, subFolder) => {
    const subFiles = convertToCodesandboxStructure(subFolder, `${prefix}${subFolder.name}/`)
    return { ...acc, ...subFiles }
  }, folderFiles)
}

interface CodesandboxFile {
  content: string
  isBinary: boolean
}

const getCodeSandboxFile = (file: GeneratedFile): CodesandboxFile => {
  return {
    content: file.content,
    isBinary: file.location === 'remote',
  }
}
