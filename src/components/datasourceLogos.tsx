import type { ReactNode } from 'react'

const C = 'h-11 w-11'

const AWS = (
  <svg viewBox="0 0 48 48" className={C} fill="none" aria-hidden="true">
    <g fill="#2E73B8">
      <rect x="8" y="14" width="9" height="16" rx="1.5" />
      <rect x="19.5" y="10" width="9" height="20" rx="1.5" opacity="0.85" />
      <rect x="31" y="16" width="9" height="14" rx="1.5" opacity="0.7" />
    </g>
    <path
      d="M9 35c8 4 22 4 30 0"
      stroke="#F90"
      strokeWidth="2.4"
      strokeLinecap="round"
      fill="none"
    />
    <path d="M36 33.5 39.5 35l-2 3" stroke="#F90" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
)

const Dremio = (
  <svg viewBox="0 0 48 48" className={C} fill="none" aria-hidden="true">
    <path
      d="M9 28c2-9 9-15 18-15 5 0 9 2 12 5-6-1-11 1-15 5-3 3-4 7-9 9-2 .8-4 .6-6-1Z"
      fill="#43BFD3"
    />
    <circle cx="31" cy="20" r="1.8" fill="#0B5563" />
  </svg>
)

const Databricks = (
  <svg viewBox="0 0 48 48" className={C} fill="none" aria-hidden="true">
    <g fill="#FF3621">
      <path d="M24 9 39 17l-3 1.7L24 12.4 12 18.7 9 17 24 9Z" />
      <path d="M24 18 39 26l-3 1.7L24 21.4 12 27.7 9 26l15-8Z" opacity="0.92" />
      <path d="M24 27 39 35l-15 8L9 35l3-1.7 12 6.3 12-6.3L24 27Z" opacity="0.85" />
    </g>
  </svg>
)

const Snowflake = (
  <svg viewBox="0 0 48 48" className={C} fill="none" aria-hidden="true">
    <g stroke="#29B5E8" strokeWidth="2.2" strokeLinecap="round">
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <g key={a} transform={`rotate(${a} 24 24)`}>
          <path d="M24 24V6" />
          <path d="M24 10 20 7M24 10 28 7M24 15 20.5 12.5M24 15 27.5 12.5" />
        </g>
      ))}
    </g>
  </svg>
)

const MySQL = (
  <svg viewBox="0 0 48 48" className={C} fill="none" aria-hidden="true">
    <path
      d="M7 30c5 0 9-2 13-7 2-2.5 3-5 6-5 4 0 5 4 9 4-1 4-5 5-9 4 1 2 3 2 5 4-3 1-6 0-9-3-2 3-4 5-8 6-3 .7-6 .3-7-3Z"
      fill="#00758F"
    />
    <circle cx="33" cy="20.5" r="1.5" fill="#F29111" />
  </svg>
)

const PostgreSQL = (
  <svg viewBox="0 0 48 48" className={C} fill="none" aria-hidden="true">
    <path
      d="M16 12c5-3 13-3 17 1 3 3 3 9 1 15-1 4-4 8-8 8-2 0-3-1-3-3 0-3 2-4 2-8 0-3-2-5-5-5s-6 2-6 7c0 4 1 7 1 9 0 2-2 3-4 2-3-2-4-8-3-15 .5-4 2-8 8-11Z"
      fill="#336791"
    />
    <circle cx="22" cy="20" r="1.6" fill="#fff" />
  </svg>
)

const SQLServer = (
  <svg viewBox="0 0 48 48" className={C} fill="none" aria-hidden="true">
    <g fill="#A4373A">
      <ellipse cx="24" cy="13" rx="13" ry="4.5" />
      <path d="M11 13v8c0 2.5 5.8 4.5 13 4.5s13-2 13-4.5v-8c0 2.5-5.8 4.5-13 4.5S11 15.5 11 13Z" opacity="0.9" />
      <path d="M11 23v8c0 2.5 5.8 4.5 13 4.5s13-2 13-4.5v-8c0 2.5-5.8 4.5-13 4.5s-13-2-13-4.5Z" opacity="0.8" />
    </g>
  </svg>
)

const Aurora = (
  <svg viewBox="0 0 48 48" className={C} fill="none" aria-hidden="true">
    <path d="M24 7 39 15.5v17L24 41 9 32.5v-17L24 7Z" fill="#2E73B8" />
    <path
      d="M17 27c0-4 3-7 7-7s7 3 7 7M31 21c0 4-3 7-7 7s-7-3-7-7"
      stroke="#fff"
      strokeWidth="2.1"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
)

const DynamoDB = (
  <svg viewBox="0 0 48 48" className={C} fill="none" aria-hidden="true">
    <path d="M24 7 39 15.5v17L24 41 9 32.5v-17L24 7Z" fill="#3F4FD6" />
    <g stroke="#fff" strokeWidth="2" fill="none">
      <ellipse cx="24" cy="18" rx="7" ry="2.6" />
      <path d="M17 18v12c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V18" />
    </g>
  </svg>
)

const S3 = (
  <svg viewBox="0 0 48 48" className={C} fill="none" aria-hidden="true">
    <path d="M13 14h22l-2.5 22a2 2 0 0 1-2 1.8H17.5a2 2 0 0 1-2-1.8L13 14Z" fill="#E25444" />
    <path d="M11 13h26v3H11z" fill="#B0322B" />
    <path d="M19 21l10 9M29 21l-10 9" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const PowerBI = (
  <svg viewBox="0 0 48 48" className={C} fill="none" aria-hidden="true">
    <rect x="11" y="22" width="7" height="16" rx="1.5" fill="#F2C811" />
    <rect x="20.5" y="14" width="7" height="24" rx="1.5" fill="#E8A317" />
    <rect x="30" y="8" width="7" height="30" rx="1.5" fill="#F2C811" />
  </svg>
)

const Oracle = (
  <svg viewBox="0 0 48 48" className={C} fill="none" aria-hidden="true">
    <rect x="9" y="17" width="30" height="14" rx="7" stroke="#C74634" strokeWidth="3.4" fill="none" />
  </svg>
)

export const DATASOURCE_LOGOS: Record<string, ReactNode> = {
  AWS,
  Dremio,
  Databricks,
  Snowflake,
  MySQL,
  PostgreSQL,
  'SQL Server': SQLServer,
  Aurora,
  DynamoDB,
  S3,
  'Power BI': PowerBI,
  Oracle,
}
