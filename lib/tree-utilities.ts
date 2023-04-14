/*export type Tree = {
    ValueTag: number;
    children: Tree[];
  };
  export function treeIterator(tree: Tree) {
    return {
      *[Symbol.iterator]() {
        let nodeStack = [tree];
        let value: number, node: Tree | undefined;
        while ((node = nodeStack.pop()) !== undefined) {
          value = node.value;
          nodeStack = nodeStack.concat(node.children);
          yield value;
        }
      },
    };
  }
 */
