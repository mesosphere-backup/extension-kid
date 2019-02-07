import { injectable, interfaces } from "inversify";
import { Observable, PartialObserver } from "rxjs";

import Container, { observe } from "./Container";

export interface IExtensionProvider<T> {
  subscribe(observer?: PartialObserver<T>): any;
  getAllExtensions(): T[];
  getTaggedExtensions(tagName: string, tagValue: any): T[];
}

@injectable()
export class ExtensionProvider<T> implements IExtensionProvider<T> {
  private serviceIdentifier: interfaces.ServiceIdentifier<T>;
  private container: Container;
  private notifications$: Observable<any>;

  constructor(
    serviceIdentifier: interfaces.ServiceIdentifier<T>,
    container: Container
  ) {
    this.serviceIdentifier = serviceIdentifier;
    this.container = container;
    this.notifications$ = observe(this.container);
  }

  public subscribe(observer?: PartialObserver<T>) {
    this.notifications$.subscribe(observer);
  }

  public getAllExtensions(): T[] {
    let services: T[] = [];
    if (this.container.isBound(this.serviceIdentifier)) {
      try {
        services = this.container.getAll<T>(this.serviceIdentifier);
      } catch (error) {
        // console.error(error);
      }
    }

    return services;
  }

  public getTaggedExtensions(tagName: string, tagValue: any): T[] {
    let services: T[] = [];
    if (this.container.isBound(this.serviceIdentifier)) {
      try {
        services = this.container.getAllTagged<T>(
          this.serviceIdentifier,
          tagName,
          tagValue
        );
      } catch (error) {
        // console.error(error);
      }
    }

    return services;
  }
}

export function bindExtensionProvider(
  bind: interfaces.Bind,
  id: symbol | string
): void {
  bind(ExtensionProvider)
    .toDynamicValue(
      context => new ExtensionProvider(id, context.container as Container)
    )
    .inSingletonScope()
    .whenTargetNamed(id);
}
