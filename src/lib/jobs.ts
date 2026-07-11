import { Job } from "./types";

// Live postings pulled from company job boards. Re-scrape periodically —
// links and openings will go stale as roles get filled or reposted.
export const jobs: Job[] = [
  {
    id: "1",
    title: "Data Engineer",
    company: "Salma Health",
    location: "Hybrid (SF Bay Area, San Diego, or Salt Lake City)",
    applyUrl: "https://jobs.ashbyhq.com/salma-health/481b69b4-f149-46c0-a159-74e445ac6f8a",
    description:
      "Own pipelines end-to-end for a HIPAA-regulated healthcare data platform: pull data from third-party APIs, build medallion-architecture transformations in dbt, and expose curated metrics through a semantic layer. Requires 4-7 years building production data pipelines, strong Python and SQL, hands-on dbt experience, and familiarity with an orchestration tool (Dagster, Airflow, or Prefect) plus AWS fundamentals.",
  },
  {
    id: "2",
    title: "Senior Data Engineer, ERP Data Harmonization",
    company: "Tessera Labs",
    location: "San Jose, CA / New York, NY (remote considered, travel required)",
    applyUrl: "https://jobs.ashbyhq.com/tessera-labs/560c1ab4-18c7-4937-add2-87d2c3a6308d",
    description:
      "Build ETL/ELT pipelines that harmonize data across ERP systems (Sage, Baan/Infor LN, Oracle, NetSuite) into unified enterprise data models, working with functional data experts to translate business rules into SQL and Python transformation logic. Requires 5-8+ years in data engineering or data integration, advanced SQL, strong Python, and enterprise data modeling experience. $180K-$250K.",
  },
  {
    id: "3",
    title: "AI Data Architect",
    company: "Innovative Solutions",
    location: "Remote (US, reports into Rochester, NY)",
    applyUrl: "https://jobs.lever.co/innovativesol-2/562f10e5-3187-4832-ab82-56aa52f284f1",
    description:
      "Design cloud data architectures on AWS spanning S3 data lakes, Glue ETL pipelines, and medallion-architecture warehouses on Redshift, Snowflake, or Databricks, plus RAG-based AI systems using Bedrock. Requires 5+ years in IT with 2+ years hands-on AWS, Python/PySpark for Glue jobs, and an AWS Professional-level certification. $150K-$200K.",
  },
  {
    id: "4",
    title: "Data Engineer",
    company: "Odaseva",
    location: "Paris, France (Hybrid, 3 days in-office)",
    applyUrl: "https://jobs.lever.co/odaseva/15ea3f56-7738-4cab-988b-05389787e0b4",
    description:
      "Design and optimize ingestion pipelines for a Salesforce-data security platform using Python, SQL, and Spark on Databricks and/or Snowflake within a Delta Lake/Iceberg lakehouse. Requires 7-12 years in data engineering or backend data platforms and hands-on production experience with Databricks and/or Snowflake.",
  },
  {
    id: "5",
    title: "Senior Data Engineer",
    company: "Zencore",
    location: "Remote (LATAM)",
    applyUrl: "https://jobs.lever.co/zencore/9e1db44f-b406-4978-909e-da9529b7ae08",
    description:
      "Design large-scale distributed data pipelines on Google Cloud (Dataflow, BigQuery) using Apache Beam, Spark, or Flink while helping enterprise clients migrate their data warehouses. Requires 4+ years as a data engineer, 2+ years hands-on GCP experience, and proficiency in Python, SQL, and Airflow.",
  },
  {
    id: "6",
    title: "Machine Learning Principal Solutions Architect",
    company: "phData",
    location: "Remote (US, Central time zone)",
    applyUrl: "https://boards.greenhouse.io/phdata/jobs/7390457",
    description:
      "Lead end-to-end architecture and delivery of AI/ML solutions for enterprise clients, working across the Spark, Snowflake, Databricks, and Redshift ecosystem while managing client relationships and mentoring engineers. Requires 10+ years building and deploying production data/ML systems and strong consulting or client-delivery experience.",
  },
];
