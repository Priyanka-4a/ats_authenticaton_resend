declare module "pdfjs-dist/legacy/build/pdf" {
  export const GlobalWorkerOptions: {
    workerSrc: string;
  };

  export function getDocument(
    src: string | Uint8Array | { data: Uint8Array }
  ): any;
}

declare module "pdfjs-dist/legacy/build/pdf.worker.entry";
