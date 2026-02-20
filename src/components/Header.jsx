import React from 'react';
import './Header.css';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import ChatIcon from '@mui/icons-material/Chat';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import HeaderOption from './HeaderOption';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import { useNavigate } from 'react-router-dom';

function Header() {
    const { logout } = useAuth();
    const { searchTerm, setSearchTerm } = useSearch();
    const navigate = useNavigate();

    const logoutOfApp = () => {
        logout();
        navigate('/login');
    };

    const goToProfile = () => {
        navigate('/profile');
    };

    return (
        <div className="header">
            <div className="header__left">
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png"
                    alt=""
                    onClick={() => navigate('/')}
                    style={{ cursor: 'pointer' }}
                />
                <div className="header__search">
                    <SearchIcon />
                    <input
                        type="text"
                        placeholder='Search Posts...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="header__right">
                <HeaderOption Icon={HomeIcon} title="Home" onClick={() => navigate('/')} />
                <HeaderOption Icon={SupervisorAccountIcon} title="My Network" onClick={() => navigate('/network')} />
                <HeaderOption Icon={BusinessCenterIcon} title="Jobs" onClick={() => navigate('/jobs')} />
                <HeaderOption Icon={ChatIcon} title="Messaging" onClick={() => navigate('/messaging')} />
                <HeaderOption Icon={NotificationsIcon} title="Notifications" onClick={() => navigate('/notifications')} />
                <HeaderOption
                    avatar={true}
                    title="Me"
                    onClick={goToProfile}
                />
                <HeaderOption
                    Icon={ExitToAppIcon}
                    title="Logout"
                    onClick={logoutOfApp}
                />
            </div>
        </div>
    );
}

export default Header;
