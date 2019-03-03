class QueryChain {
  private queue: any[];

  constructor(queue: any[]) {
    this.queue = queue;
  }

  public exec(defaults: any) {
    return Promise.all(this.queue).then(data => {
      const documents = Array.isArray(data) ? data : [data];
      return documents.map((document) => {
        return { ...defaults, ...document }; 
      });
    })
  }
}

export default QueryChain;