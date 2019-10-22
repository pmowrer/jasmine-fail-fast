declare module '@outlinerisk/jasmine-fail-hardcore' {
  export function shutItDown(): void
  export default function init(alreadyFailed: boolean, onFailure): () => void
}
