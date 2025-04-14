const serviceMap: Map<any, any> = new Map();

export function Service(key?: string) {
  return (target: any) => {
    serviceMap.set(key ?? target.name, new target());
  };
}

export function Inject(key?: string) {
  return function (target: any, propertyKey: string) {
    const name =
      key ?? Reflect.getMetadata("design:type", target, propertyKey).name;
    Object.defineProperty(target, propertyKey, {
      get() {
        return serviceMap.get(name);
      },
      enumerable: true,
      configurable: true,
    });
  };
}
