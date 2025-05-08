import "reflect-metadata";

export type Methods = "post" | "get" | "delete" | "put" | "patch";

// 定义元数据存储键
export const ROUTE_METADATA_KEY = Symbol("route_metadata");

export function Route(method: "POST" | "GET", path: string) {
  return function (
    cls: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const metadata = {
      method: method.toLocaleLowerCase() as Methods,
      path: path,
      handler: descriptor.value,
    };
    // const data = Reflect.getMetadata(ROUTE_METADATA_KEY, cls.prototype) || [];
    // console.log(data,'data')
    Reflect.defineMetadata(
      ROUTE_METADATA_KEY,
      [...(Reflect.getMetadata(ROUTE_METADATA_KEY, cls) || []), metadata],
      cls
    );
  };
}

export const Get = (path: string) => Route("GET", path);
export const Post = (path: string) => Route("POST", path);

export const Controller = (prefix: string) => {
  return function <T extends new (...args: any[]) => {}>(cls: T) {
    class ControllerClass extends cls {
        basePath = prefix;
    }
    return ControllerClass;
  };
};
