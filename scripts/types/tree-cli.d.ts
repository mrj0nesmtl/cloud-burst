declare module 'tree-cli' {
  interface ITreeNode {
    name: string;
    children?: ITreeNode[];
  }

  interface ITreeRoot {
    name: string;
    children: ITreeNode[];
  }

  interface IFlags {
    base: string;
    ignore?: string[];
    maxDepth?: number;
    dirsFirst?: boolean;
    exclude?: RegExp[];
  }

  interface IResult {
    data: string | ITreeRoot;
  }

  function treeify(flags: Partial<IFlags>): Promise<IResult>;
  export default treeify;
} 