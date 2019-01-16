import { injectable, interfaces } from "inversify";
import { BehaviorSubject } from "rxjs";
import { PartialObserver } from "rxjs/Observer"; //tslint:disable-line no-submodule-imports

import Container from "./Container";

export interface IExtensionProvider<T> {
  subscribe(observer?: PartialObserver<T>): any;
  getAllExtensions(): T[];
  getTaggedExtensions(tagName: string, tagValue: any): T[];
}

@injectable()
export class ExtensionProvider<T> implements IExtensionProvider<T> {
  private serviceIdentifier: interfaces.ServiceIdentifier<T>;
  private container: Container;
  private services$: BehaviorSubject<any>;

  constructor(
    serviceIdentifier: interfaces.ServiceIdentifier<T>,
    container: Container
  ) {
    this.serviceIdentifier = serviceIdentifier;
    this.container = container;
    this.services$ = new BehaviorSubject<any>(null);

    this.container.addEventListener<
      T
    >(Container.BOUND, (identifier: interfaces.ServiceIdentifier<T>) => {
      if (identifier === this.serviceIdentifier) {
        this.services$.next(":)");
      }
    });
  }

  public subscribe(observer?: PartialObserver<T>) {
    this.services$.subscribe(observer);
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
