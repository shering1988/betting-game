import {Navigate} from "react-router-dom";
import React from "react";
import useAuth from "../hook/useAuth";
import Layout from "./Layout";
import Error from "../page/Error";

const ProtectedPage = ({ children }: { children: React.ReactElement | string }) => {
    const auth = useAuth();

    if (!auth.getUser()) {
        return <Navigate to="/login" replace />;
    }

    if(!auth.getUser()?.isAdmin) {
        return <Error number={403} message={"Zugriff verweigert"} />;
    }

    return <Layout>
        {children}
    </Layout>;
};

export default ProtectedPage;