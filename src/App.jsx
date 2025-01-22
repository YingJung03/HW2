import { useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

function App() {
  // 當登入成功時，渲染頁面
  // 未登入時 false，登入後改成 true
  const [isAuth, setIsAuth] = useState(false);

  const [tempProduct, setTempProduct] = useState({});
  const [products, setProduct] = useState([]);

  async function login(e) {
    try {
      e.preventDefault();
      // console.log(import.meta.env.VITE_BASE_URL);
      // console.log(import.meta.env.VITE_API_PATH);
      const res = await axios.post(`${BASE_URL}/v2/admin/signin`, user);
      // 解構
      const { token, expired } = res.data;
      // console.log(token, expired);
      // 存入 cookie
      document.cookie = `hexToken=${token}; expires=${new Date(
        expired
      )}; path=/`;

      if (res) {
        setIsAuth(true);
      }

      axios.defaults.headers.common.Authorization = token;

      const resProd = await axios.get(
        `${BASE_URL}/v2/api/${API_PATH}/admin/products`
      );

      setProduct(resProd.data.products);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleInput(e) {
    const { name } = e.target;
    console.log(e.target.value);
    setUser({
      // 直接覆蓋
      ...user, // 展開：把原始物件展開帶入（不然password會被覆蓋）
      [name]: e.target.value,
    });
  }

  const [user, setUser] = useState({
    username: "",
    password: "",
  });

  async function checkLogin() {
    try {
      const token = document.cookie
        .split(";")
        .find((row) => row.startsWith("hexToken="))
        ?.split("=")[1];
      console.log(token);
      axios.defaults.headers.common.Authorization = token;
      await axios.post(`${BASE_URL}/api/user/check`);
      alert("使用者已登入");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      {isAuth ? (
        <div className="container">
          <div className="row">
            {/* 商品列表 */}
            <div className="col-6">
              <button
                type="button"
                className="btn btn-success mb-5"
                onClick={checkLogin}
              >
                確認是否登入
              </button>
              <h2>產品列表</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">產品名稱</th>
                    <th scope="col">原價</th>
                    <th scope="col">售價</th>
                    <th scope="col">是否啟用</th>
                    <th scope="col">查看細節</th>
                  </tr>
                </thead>
                <tbody>
                  {/* 迭代商品資料，動態生成表格行 */}
                  {products.map((item) => {
                    return (
                      <tr key={item.id}>
                        <td scope="row">{item.title}</td>
                        <td>{item.origin_price}</td>
                        <td>{item.price}</td>
                        <td>{item.is_enabled}</td>
                        <td>
                          {/* 點擊按鈕時更新選擇的商品 */}
                          <button
                            onClick={() => {
                              setTempProduct(item); // 將當前商品設定為選中狀態
                            }}
                            type="button"
                            className="btn btn-success"
                          >
                            查看詳細資訊
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 單一商品細節 */}
            <div className="col-6">
              <h2>單一產品細節</h2>
              {/* 如果有選擇商品則顯示其細節，否則顯示提示 */}
              {tempProduct.title ? (
                <div className="card">
                  <img
                    src={tempProduct.imageUrl}
                    className="card-img-top"
                    alt={tempProduct.title}
                  />
                  <div className="card-body">
                    <h5 className="card-title">
                      {tempProduct.title}{" "}
                      <span className="badge text-bg-primary">
                        {tempProduct.category}
                      </span>
                    </h5>
                    <p className="card-text">
                      商品描述：{tempProduct.description}
                    </p>
                    <p className="card-text">商品內容：{tempProduct.content}</p>
                    <p className="card-text">
                      <del>{tempProduct.origin_price}</del> 元 /{" "}
                      {tempProduct.price} 元
                    </p>
                    <h5 className="card-title">更多圖片：</h5>
                    {tempProduct.imagesUrl &&
                      tempProduct.imagesUrl.map((image, index) => {
                        return (
                          <img
                            className="img-fluid"
                            src={image}
                            key={index}
                            alt="商品圖片"
                          />
                        );
                      })}
                  </div>
                </div>
              ) : (
                // 當未選擇商品時的提示訊息
                <p>請選擇一個商品查看</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column d-flex justify-content-center align-items-center vh-100">
          <h1 className="mb-5">請先登入</h1>
          <form onSubmit={login}>
            <div className="input-group mb-3">
              <input
                type="email"
                id="email"
                name="username"
                className="form-control"
                placeholder="Email address"
                onChange={handleInput}
              />
            </div>
            <div className="input-group mb-3">
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                placeholder="Password"
                onChange={handleInput}
              />
            </div>

            <button className="btn btn-secondary">登入</button>
          </form>
        </div>
      )}
    </>
  );
}

export default App;
