import ow from 'ow';

class QueryChain {
  private task: Promise<any>;

  constructor(task: Promise<any>) {
    ow(task, ow.promise);
    this.task = task;
  }

  public exec(defaults: any = {}): Promise<any> {
    ow(defaults, ow.object.plain);
    return this.task.then(data => {
      if (Array.isArray(data)) {
        return data.map(document => {
          return { ...defaults, ...document };
        });
      } else if (typeof data === 'object') {
        return { ...defaults, ...data };
      }
    });
  }
}

export default QueryChain;
