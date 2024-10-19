import React from "react"
import App from "./popupEdit"
import createAppRoot from "@/lib/createRootApp"
import Layout from "@/components/Layout"

const root = createAppRoot()
root.render(
    <Layout>
        <App />
    </Layout>
)

export default root
