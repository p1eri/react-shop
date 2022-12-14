import React from 'react';
import { Route } from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header';
import Drawer from './components/Drawer';
import AppContext from './context';

import Home from './pages/Home';
import Favorites from './pages/Favorites';
import Orders from './pages/Orders';

function App() {
  const [items, setItems] = React.useState([]);
  const [cartItems, setCartItems] = React.useState([]);
  const [favorites, setFavorites] = React.useState([]);
  const [searchValue, setSearchValue] = React.useState('');
  const [cartOpened, setCartOpened]  = React.useState(false);
  const [isLoading, setIsLoading]  = React.useState(true);

  React.useEffect(() => {
    try {
      async function fetchData() {
        const [cartResponse , favoritesResponse ,itemResponse] = await Promise.all([
          axios.get('https://631d8c1ecc652771a4874ea9.mockapi.io/cart'),
          axios.get('https://631d8c1ecc652771a4874ea9.mockapi.io/favorites'),
          axios.get('https://631d8c1ecc652771a4874ea9.mockapi.io/items'),
        ]);
        
        setIsLoading(false);
  
        setCartItems(cartResponse.data);
        setFavorites(favoritesResponse.data);
        setItems(itemResponse.data);
      }
      fetchData();
    } catch (error) {
      alert('Ошибка при запросе данных')
      console.error(error)
    }
  }, []);

  const onAddToCart = async (obj) => {
    try {
      const findItem = cartItems.find((item) => Number(item.parentId) === Number(obj.id));
      if (findItem) {
        setCartItems((prev) => prev.filter((item) => Number(item.parentId) !== Number(obj.id)));
        await axios.delete(`https://631d8c1ecc652771a4874ea9.mockapi.io/cart/${findItem.id}`);
      }else{
        setCartItems((prev) => [...prev, obj]);
        const {data} = await axios.post('https://631d8c1ecc652771a4874ea9.mockapi.io/cart', obj);
        setCartItems((prev) =>
          prev.map((item) => {
            if (item.parentId === data.parentId) {
              return {
                ...item,
                id: data.id,
              };
            }
            return item;
        }),
      );
    }
  } catch (error) {
    alert('Ошибка при добавлении в корзину');
    console.error(error);
  }
};

  const onRemoveItem = (id) => {
    try {
      axios.delete(`https://631d8c1ecc652771a4874ea9.mockapi.io/cart/${id}`);
      setCartItems(prev => prev.filter(item => Number(item.id) !== Number(id)));
    } catch (error) {
      alert('Ошибка удаления товара')
      console.error(error)
    }
  }

  const onAddFavorite = async (obj) => {
    try {
      if (favorites.find((favObj) => Number(favObj.id) === Number(obj.id))) {
        axios.delete(`https://631d8c1ecc652771a4874ea9.mockapi.io/favorites/${obj.id}`);
        setFavorites((prev) => prev.filter((item) => Number(item.id) !== Number(obj.id)));
      } else {
        const { data } = await axios.post(
          'https://631d8c1ecc652771a4874ea9.mockapi.io/favorites', 
          obj,
          );
        setFavorites((prev) => [...prev, data]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onChangeSearchInput = (event) => {
    setSearchValue(event.target.value);
  }

  const isItemAdded = (id) => {
    return cartItems.some((obj) => Number(obj.parentId) === Number(id));
  }

  return (
    <AppContext.Provider value={{ items, cartItems, favorites, isItemAdded, setCartOpened, onAddFavorite, setCartItems, onAddToCart }}>
    <div className="wrapper clear">
      <Drawer items={cartItems} onClose={() => setCartOpened(false)} onRemove={onRemoveItem} opened={cartOpened} />
      
      <Header onClickCart={() => setCartOpened(true)}/>

      <Route path='/' exact>
        <Home 
          items={items}
          cartItems={cartItems}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          onChangeSearchInput={onChangeSearchInput}
          onAddFavorite={onAddFavorite}
          onAddToCart={onAddToCart}
          isLoading={isLoading}
        />
      </Route>

      <Route path='/favorites' exact>
        <Favorites/>
      </Route>

      <Route path='/orders' exact>
        <Orders/>
      </Route>
    </div>
    <div className="d-flex align-center justify-center flex-column flex">
        <p className="opacity-6">Code with love by <a href='https://t.me/pavlovdeveloper'>p1err</a></p>
      </div>
    </AppContext.Provider>
  );
}

export default App;
