import BrowserOnly from "@docusaurus/BrowserOnly";
import * as React from "react";
const LazyWorldbuilder = React.lazy(() =>
  import("../components/worldbuilder/Worldbuilder")
);

export default function() {
  return (
    <BrowserOnly>
      {() => {
        return (
          <React.Suspense>
            <LazyWorldbuilder />
          </React.Suspense>
        );
      }}
    </BrowserOnly>
  );
}
