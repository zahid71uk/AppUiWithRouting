import type { Metadata } from "next";
import Link from "next/link";

import { DatasetUploadForm } from "@/components/dataset-upload-form";
import { paginateDataset } from "@/lib/dataset-pagination";
import { getModelDataSnapshot } from "@/lib/model-data-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Data management | Parcel",
  description: "Active housing dataset and prediction model status.",
};

const currency = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

const uploadEnabled = process.env.NEXT_PUBLIC_DATASET_UPLOAD_ENABLED === "true"
  && process.env.DATASET_UPLOAD_ENABLED === "true"
  && Boolean(process.env.DATASET_UPLOAD_TOKEN);

type DataManagementPageProps = {
  searchParams: Promise<{ page?: string | string[] }>;
};

export default async function DataManagementPage({ searchParams }: DataManagementPageProps) {
  const [snapshot, params] = await Promise.all([getModelDataSnapshot(), searchParams]);
  const pageParameter = Array.isArray(params.page) ? params.page[0] : params.page;
  const pageNumber = pageParameter && /^\d+$/.test(pageParameter) ? Number(pageParameter) : 1;
  const page = paginateDataset(snapshot.houses, pageNumber);

  return (
    <div className="page-wrap">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">PROPERTY DESK <span className="eyebrow-slash">/</span> DATA</p>
          <h1>Data management</h1>
        </div>
        <span className="page-index">05 <span>/</span> 05</span>
      </div>

      <section className="model-data-overview" aria-label="Active dataset and model status">
        <div className="analysis-panel model-data-status">
          <p className="eyebrow">ACTIVE DATASET</p>
          <strong>{snapshot.houses.length.toLocaleString("en-GB")}</strong>
          <span>source rows</span>
        </div>
        <div className="analysis-panel model-data-status">
          <p className="eyebrow">PREDICTION MODEL</p>
          <strong className={snapshot.modelLoaded ? "model-ready" : "model-unavailable"}>
            {snapshot.modelLoaded ? "Ready" : "Unavailable"}
          </strong>
          <span>{snapshot.metrics ? `Trained ${new Date(snapshot.metrics.trained_at).toLocaleString("en-GB")}` : "Train the model before requesting predictions"}</span>
        </div>
        {snapshot.metrics && (
          <div className="analysis-panel model-data-status">
            <p className="eyebrow">HOLDOUT MAE</p>
            <strong>{currency.format(snapshot.metrics.mae)}</strong>
            <span>{snapshot.metrics.test_samples.toLocaleString("en-GB")} test rows</span>
          </div>
        )}
      </section>

      {uploadEnabled && (
        <section className="analysis-panel dataset-upload-panel" aria-labelledby="upload-heading">
          <div>
            <p className="eyebrow">ACTIVE DATASET</p>
            <h2 id="upload-heading">Replace and retrain</h2>
          </div>
          <DatasetUploadForm maxUploadBytes={Number(process.env.MAX_DATASET_UPLOAD_BYTES ?? 5 * 1024 * 1024)} />
        </section>
      )}

      <section className="analysis-panel model-data-table-panel" aria-labelledby="dataset-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">SOURCE ROWS</p>
            <h2 id="dataset-heading">Current housing sample</h2>
          </div>
          <span className="table-count">
            Showing {page.firstItem}-{page.lastItem} of {snapshot.houses.length}
          </span>
        </div>
        <div className="table-scroll">
          <table className="data-table model-data-table">
            <thead>
              <tr><th scope="col">ID</th><th scope="col">Area</th><th scope="col">Beds</th><th scope="col">Built</th><th scope="col">Price</th></tr>
            </thead>
            <tbody>
              {page.items.map((house) => (
                <tr key={house.id}>
                  <th scope="row">{house.id}</th>
                  <td>{house.square_footage.toLocaleString("en-GB")} sq ft</td>
                  <td>{house.bedrooms}</td>
                  <td>{house.year_built}</td>
                  <td className="price-cell">{currency.format(house.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <nav className="dataset-pagination" aria-label="Dataset page navigation">
          {page.currentPage > 1 ? (
            <Link className="button button-quiet" href={`?page=${page.currentPage - 1}`} rel="prev">
              Previous
            </Link>
          ) : (
            <span className="button button-quiet pagination-disabled" aria-disabled="true">Previous</span>
          )}
          <span className="pagination-current" aria-current="page">
            Page {page.currentPage} of {page.totalPages}
          </span>
          {page.currentPage < page.totalPages ? (
            <Link className="button button-quiet" href={`?page=${page.currentPage + 1}`} rel="next">
              Next
            </Link>
          ) : (
            <span className="button button-quiet pagination-disabled" aria-disabled="true">Next</span>
          )}
        </nav>
      </section>
    </div>
  );
}