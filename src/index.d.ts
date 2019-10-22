declare module 'add-dashes' {
  export function shutItDown(): void
  export default function init(alreadyFailed: boolean, onFailure): () => void
}
