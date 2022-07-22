import BrowserOnly from "@docusaurus/BrowserOnly";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import * as React from "react";
import styles from "./index.module.css";
function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    // <header className={clsx("hero hero--primary", styles.heroBanner)}>
    <div className="container">
      <h1 className="hero__title">{siteConfig.title}</h1>
      <p className="hero__subtitle">{siteConfig.tagline}</p>
      <div className={styles.buttons}>
        <Link className="button button--secondary button--lg" to="/docs/intro">
          Create your first planet - 5min ⏱️
        </Link>
      </div>
    </div>
    // </header>
  );
}

const OtherComponent = React.lazy(() => import("../components/Whatever"));

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <BrowserOnly>
      {() => {
        return (
          <React.Suspense>
            <OtherComponent />
          </React.Suspense>
        );
      }}
    </BrowserOnly>
  );
}
