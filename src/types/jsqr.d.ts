declare module 'jsqr' {
  interface QROptions {
    inversionAttempts?: 'dontInvert' | 'onlyInvert' | 'attemptBoth' | 'invertFirst';
  }

  interface QRPoint {
    x: number;
    y: number;
  }

  interface QRLocation {
    topRightCorner: QRPoint;
    topLeftCorner: QRPoint;
    bottomRightCorner: QRPoint;
    bottomLeftCorner: QRPoint;
  }

  interface QRCode {
    data: string;
    location: QRLocation;
  }

  function jsQR(
    data: Uint8ClampedArray, 
    width: number, 
    height: number, 
    options?: QROptions
  ): QRCode | null;

  export default jsQR;
} 