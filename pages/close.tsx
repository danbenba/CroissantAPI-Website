import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
class ClosePage extends Component<{ t: any }> {
  render() {
    const { t } = this.props;
    return (
      <div
        className="container"
        style={{ padding: "20px", borderRadius: "8px" }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            textAlign: "center",
            margin: "40px 0",
            color: "white",
            letterSpacing: "1px",
          }}
        >
          {t("close.title")}
        </h1>
      </div>
    );
  }
}

export default withTranslation("common")(ClosePage);
