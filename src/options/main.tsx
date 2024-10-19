import React from "react"
import App from "./options"
import createAppRoot from "@/lib/createRootApp"
import Layout from "@/components/Layout"

const root = createAppRoot()
root.render(
    <Layout>
        <App />
    </Layout>
)

export default root
