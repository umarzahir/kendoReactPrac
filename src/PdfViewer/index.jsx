import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { PDFViewer } from '@progress/kendo-react-pdf-viewer';
import { SampleFileBase64 } from "./base64Sample";


function PDFV() {
  return <PDFViewer data={SampleFileBase64} style={{
    height: 615
  }} />;
}
export default PDFV