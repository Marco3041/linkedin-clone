import React from 'react';
import './HeaderOption.css';
import { Avatar } from '@mui/material';
import { useAuth } from '../context/AuthContext';

function HeaderOption({ avatar, Icon, title, onClick }) {
    const { currentUser } = useAuth();

    return (
        <div onClick={onClick} className="headerOption">
            {Icon && <Icon className="headerOption__icon" />}
            {avatar && (
                <Avatar className="headerOption__icon" src={currentUser?.photoURL}>
                    {currentUser?.displayName?.[0]}
                </Avatar>
            )}
            <h3 className="headerOption__title">{title}</h3>
        </div>
    );
}

export default HeaderOption;
