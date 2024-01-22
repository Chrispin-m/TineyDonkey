import { useEffect, useState } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { MdOutlineShoppingBag } from "react-icons/md";
import { useCart } from 'react-use-cart';
import Footer from '../Components/Footer';
import axios from 'axios';

function ExpandedProduct() {
    const navigate = useNavigate();
    const location = useLocation();

    const [scrolling, setScrolling] = useState(false);
    const [activeThumbnailIndex, setActiveThumbnailIndex] = useState(0);
    const [product, setProduct] = useState()

    const { addItem } = useCart();

    const handleThumbnailClick = (index) => {
        setActiveThumbnailIndex(index)
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setScrolling(true);
            } else {
                setScrolling(false);
            }
        };
        window.scrollTo(0, 0)

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        if (location.state) {
            const { data } = location.state;
            setProduct(data)
        }

    }, [location.state])



    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const idFromQuery = searchParams.get('id');
        console.log('id from query', idFromQuery)
        const fetchData = async () => {
            await axios.get(`http://localhost:3000/fetchProduct?id=${idFromQuery}`)
                .then((prod) => {
                    setProduct(prod.data)
                })
                .catch(err => console.log(err))
        }
        if (product === null || product === undefined) {
            fetchData()
        }

    }, [location.search, product])

    const handleAddProductToCart = () => {
        if (product) {
            const updatedProducts = {
                id: product._id,
                image: product.image,
                productName: product.productName,
                price: product.price
            }
            addItem(updatedProducts)
        }
    }
    return (
        <div className={product ? 'expanded-product-container flex-column-align-center ' : 'height100vh expanded-product-container flex-column-justify-content-space-between'}>
            <nav className={`navbar ${scrolling ? 'scrolled' : 'scrolled'}`} style={{ border: 'none' }}>
                <section className="flex-justify-content-space-between" style={{ borderBottom: 'none' }}>
                    <p>TineyDonkey</p>
                    <ul>
                        <li style={{ color: 'grey' }} onClick={() => navigate('/')}>Home</li>
                        <li style={{ color: 'grey' }} onClick={() => navigate('/Products')}>Products</li>
                        <li style={{ color: 'grey' }} onClick={() => navigate('/Contact')}>Contact</li>
                        <li style={{ color: 'grey' }} onClick={() => navigate('/About')}>About</li>
                    </ul>
                    <div className='flex-justify-flex-end navbar-icon-div' style={{ widthead: '15%', paddingRight: '30px' }}>
                        <MdOutlineShoppingBag style={{ color: 'grey', fontSize: '20px', float: 'right', cursor: 'pointer', marginLeft: '30px' }} />
                    </div>
                </section>
            </nav>

            {product ? <main className='expanded-flex-container flex-justify-content-space-between'>
                <div className="product-gallery">
                    <div>
                        <p><span>HOME / FIGURINES / </span>{product && product.productName.toUpperCase()}</p>
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <img
                            src={`http://localhost:3000/Images/${product && product.image[activeThumbnailIndex]}`}
                            alt="Main Product"
                            loading='lazy'
                            style={{
                                maxWidth: '100%',
                                loading: 'lazy',
                                height: 'auto'
                            }}
                            className='main-image-expanded'
                        />
                    </div>

                    <div className='flex-justify-flex-start width100' style={{ marginTop: "10px" }}>
                        {product && product.image.map((imageName, index) => (
                            <img
                                key={index}
                                loading='lazy'
                                src={`http://localhost:3000/Images/${product && imageName}`}
                                alt={`Thumbnail ${index + 1}`}
                                style={{
                                    maxWidth: "100px",
                                    // height: "80px",
                                    marginRight: "10px",
                                    cursor: "pointer",
                                    // aspectRatio: '1 / 1',
                                    loading: 'lazy',
                                    border: index === activeThumbnailIndex ? "2px solid rgb(208, 228, 208)" : "2px solid transparent"
                                }}
                                onClick={() => handleThumbnailClick(index)}
                            />
                        ))}
                    </div>
                </div>

                <div className='expanded-product-right-div flex-column-justify-flex-start'>
                    <h1 className='font-merriweather width100'>{product && product.productName}</h1>
                    <h3>KSh{product && product.price}</h3>
                    <p id='stock'>1 in stock</p>
                    <div className='flex-align-center-justify-center width100'>
                        <button className='cta-button width100' onClick={handleAddProductToCart}>Add to cart</button>
                        {/* <button className='cta-button'>View cart</button> */}
                    </div>
                    <p style={{ color: '#687279', fontSize: '13px', fontWeight: '700', marginTop: '30px' }}>CATEGORY:<span style={{ color: '#687279', fontSize: '13px', fontWeight: '500' }}> FIGURINES</span></p>
                </div>
            </main> : <div className="width100 flex-align-center-justify-center">
                <p>Loading...</p>
            </div>}
            <Footer />
        </div>
    )
}

export default ExpandedProduct