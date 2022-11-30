// I've never had to use a linked list in my life
// Why start now?

export class Node<T> {
  public value: T;
  public next: Node | null;

  constructor(value: T) {
    this.value = value;
    this.next = null;
  }
}

export class LinkedList<T> {
  public head: Node<T> | null;
  public tail: Node<T> | null;
  public length: number;

  constructor(value?: T) {
    if (value === null || value === undefined) {
      this.head = null;
      this.tail = null;
      this.length = 0;

      return;
    }

    const node: Node<T> = new Node(value);

    this.head = node;
    this.tail = node;
    this.length = 1;
  }

  public traverse(): T[] {
    const array: T[] = [];
    if (!this.head) {
      return array;
    }

    const addToArray = (node: Node<T>): T[] => {
      array.push(node.value);
      return node.next ? addToArray(node.next) : array;
    };
    return addToArray(this.head);
  }

  public append(value: T): Node<T> {
    const node: Node<T> = new Node(value);

    if (!this.length) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail && (this.tail.next = node);
      this.tail = node;
    }

    this.length++;

    return node;
  }

  public prepend(value: T): Node<T> {
    const node: Node<T> = new Node(value);

    if (!this.length) {
      this.tail = node;
    } else {
      node.next = this.head;
    }

    this.head = node;
    this.length++;

    return node;
  }

  public shift(): Node<T> | undefined {
    if (!this.length) return undefined;

    const node = this.head;

    node.next = null;
    this.head = this.head.next;
    this.length--;

    if (!this.length) {
      this.tail = null;
    }

    return node;
  }

  public pop(): Node | undefined {
    if (!this.head) return undefined;

    let temp: Node = this.head;
    let pre: Node = this.head;

    while (temp.next) {
      pre = temp;
      temp = temp.next;
    }

    this.tail = pre;
    this.tail.next = null;
    this.length--;

    if (!this.length) {
      this.head = undefined;
      this.tail = undefined;
    }

    return temp;
  }

  public get(index: number): Node | undefined {
    if (index < 0 || index >= this.length) return;

    let node: Node = this.head;

    for (let i = 0; i < index; i++) {
      node = node.next;
    }

    return node;
  }

  public set(index: number, value: unknown): Node | undefined {
    const node: Node | undefined = this.get(index);

    if (!node) return;

    node.value = value;

    return node;
  }

  public insert(index: number, value: unknown): Node | undefined {
    if (!index) return this.prepend(value);
    if (index === this.length) return this.append(value);
    if (index < 0 || index > this.length) return;

    const newNode: Node = new Node(value);
    const temp: Node = this.get(index - 1);

    newNode.next = temp.next;
    temp.next = newNode;

    this.length++;

    return newNode;
  }

  public remove(index: number): Node | undefined {
    if (index === 0) return this.shift();
    if (index === this.length - 1) return this.pop();
    if (index < 0 || index > this.length) return;

    const before: Node = this.get(index - 1);
    const node: Node = before.next;

    before.next = node.next;
    node.next = null;

    this.length--;

    return node;
  }
}
