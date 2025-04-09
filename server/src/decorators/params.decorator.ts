import "reflect-metadata";

enum ParamsType {
  Params = "params",
  Query = "query",
  Body = "body",
}

export function BaseParams(paramsType: ParamsType, dtoType?: any) {
  return (target: any, methodName: string, paramIndex: number) => {
    Reflect.defineMetadata(
      `${paramsType}Parameters`,
      { index: paramIndex, type: dtoType },
      target,
      methodName
    );
  };
}

export function Body(dtoType?: any) {
  return BaseParams(ParamsType.Body, dtoType);
}

export function Query() {
  return BaseParams(ParamsType.Query, Object);
}

export function Params() {
    return BaseParams(ParamsType.Params);
  }
