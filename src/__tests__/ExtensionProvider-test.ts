import Container from "../Container";
import { ExtensionProvider } from "../ExtensionProvider";

describe("ExtensionProvider", () => {
  const container = new Container();
  const TestServiceExtension = Symbol("TestServiceExtension");

  beforeAll(() => {
    container
      .bind(ExtensionProvider)
      .toDynamicValue(
        context =>
          new ExtensionProvider(
            TestServiceExtension,
            context.container as Container
          )
      )
      .inSingletonScope()
      .whenTargetNamed(TestServiceExtension);
  });

  describe("subscribe", () => {
    describe("bind", () => {
      afterAll(() => {
        container.unbind(TestServiceExtension);
      });

      it("notifies subscribers", done => {
        const provider = container.getNamed(
          ExtensionProvider,
          TestServiceExtension
        );
        provider.subscribe({
          next(serviceIdentifier) {
            expect(serviceIdentifier).toBe(TestServiceExtension);
            done();
          }
        });
        container.bind(TestServiceExtension).toConstantValue(42);
      });
    });

    describe("unbind", () => {
      beforeAll(() => {
        container.bind(TestServiceExtension).toConstantValue(42);
      });

      // afterAll(() => {
      //   container.unbind(TestServiceExtension);
      // });

      it("notifies subscribers", done => {
        const provider = container.getNamed(
          ExtensionProvider,
          TestServiceExtension
        );
        provider.subscribe({
          next(serviceIdentifier) {
            expect(serviceIdentifier).toBe(TestServiceExtension);
            done();
          }
        });
        container.unbind(TestServiceExtension);
      });
    });
  });

  describe("getAllExtensions", () => {
    beforeEach(() => {
      container.bind(TestServiceExtension).toConstantValue(42);
      container.bind(TestServiceExtension).toConstantValue(43);
    });
    afterEach(() => {
      container.unbind(TestServiceExtension);
    });

    it("returns all extensions", () => {
      const provider = container.getNamed(
        ExtensionProvider,
        TestServiceExtension
      );

      expect(provider.getAllExtensions()).toEqual([42, 43]);
    });
  });

  describe("getTaggedExtensions", () => {
    beforeEach(() => {
      container
        .bind(TestServiceExtension)
        .toConstantValue(42)
        .whenTargetTagged("tag", "dcos");
      container
        .bind(TestServiceExtension)
        .toConstantValue(43)
        .whenTargetTagged("tag", "dcos-ui");
    });
    afterEach(() => {
      container.unbind(TestServiceExtension);
    });

    it("returns all tagged extensions", () => {
      const provider = container.getNamed(
        ExtensionProvider,
        TestServiceExtension
      );

      expect(provider.getTaggedExtensions("tag", "dcos")).toEqual([42]);
    });
  });
});
