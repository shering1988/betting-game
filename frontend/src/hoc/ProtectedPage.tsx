import {Navigate} from "react-router-dom";
import React from "react";
import useAuth from "../hook/useAuth";
import Layout from "./Layout";

const ProtectedPage = ({ children }: { children: React.ReactElement | string }) => {
    const auth = useAuth();

    if (!auth.getUser()) {
        return <Navigate to="/login" replace />;
    }

    return <Layout>
        {children}
    </Layout>;
};

export default ProtectedPage;