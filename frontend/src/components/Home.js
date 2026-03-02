import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProducts } from "../actions/productActions";
import Loader from "./layouts/Loader";
import MetaData from "./layouts/MetaData";
import Product from "./product/Product";
import { toast } from 'react-toastify';
import Pagination from 'react-js-pagination';

export default function Home() {
    const dispatch = useDispatch();
    const { products, loading, error, productsCount, resPerPage } = useSelector((state) => state.productsState);
    const [currentPage, setCurrentPage] = useState(1);

    const setCurrentPageNo = (pageNo) => { setCurrentPage(pageNo); };

    useEffect(() => {
        if (error) {
            return toast.error(error, { position: toast.POSITION.BOTTOM_CENTER });
        }
        dispatch(getProducts(null, null, null, null, currentPage));
    }, [error, dispatch, currentPage]);

    return (
        <Fragment>
            {loading ? <Loader /> :
                <Fragment>
                    <MetaData title={'DRDO DAMS — Equipment Registry'} />

                    {/* Hero Banner */}
                    <div className="dams-hero">
                        <div className="dams-hero-icon">🏭</div>
                        <div className="dams-hero-text">
                            <h2>Defence Asset Management System</h2>
                            <p>
                                DRDL, Hyderabad &nbsp;·&nbsp; Ministry of Defence, Govt. of India &nbsp;·&nbsp;
                                Distributed Database — MongoDB Replica Set
                            </p>
                        </div>
                        <div className="dams-classified-badge">⬛ RESTRICTED ACCESS</div>
                    </div>

                    {/* Equipment listing */}
                    <h1 id="products_heading">🛡️ Available Defence Equipment</h1>

                    <section id="products" className="container mt-3">
                        <div className="row">
                            {products && products.map(product => (
                                <Product col={3} key={product._id} product={product} />
                            ))}
                        </div>
                    </section>

                    {productsCount > 0 && productsCount > resPerPage ?
                        <div className="d-flex justify-content-center mt-5">
                            <Pagination
                                activePage={currentPage}
                                onChange={setCurrentPageNo}
                                totalItemsCount={productsCount}
                                itemsCountPerPage={resPerPage}
                                nextPageText={'Next'}
                                firstPageText={'First'}
                                lastPageText={'Last'}
                                itemClass={'page-item'}
                                linkClass={'page-link'}
                            />
                        </div> : null
                    }
                </Fragment>
            }
        </Fragment>
    );
}