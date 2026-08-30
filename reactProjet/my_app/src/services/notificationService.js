import api from './api';

export const getUserNotifications = async (userId, token) => {
	try {
		const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
		const response = await api.get(`/notification/user/${userId}`, config);
		return response.data.notifications || [];
	} catch (error) {
		console.error('Erreur lors de la récupération des notifications :', error);
		throw error.response?.data || error;
	}
};

export const markNotificationRead = async (notificationId, userId, token) => {
	try {
		const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
		const response = await api.patch(
			`/notification/markAsRead/${notificationId}`,
			{ userId },
			config
		);
		return response.data;
	} catch (error) {
		console.error('Erreur lors du marquage de la notification comme lue :', error);
		throw error.response?.data || error;
	}
};

export const markAllNotificationsRead = async (userId, token) => {
	try {
		const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
		const response = await api.patch(`/notification/markAllAsRead/${userId}`, null, config);
		return response.data;
	} catch (error) {
		console.error('Erreur lors du marquage de toutes les notifications comme lues :', error);
		throw error.response?.data || error;
	}
};

export const deleteNotification = async (notificationId, userId, token) => {
	try {
		const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
		const response = await api.delete(`/notification/${notificationId}`, {
			...config,
			data: { userId },
		});
		return response.data;
	} catch (error) {
		console.error('Erreur lors de la suppression de la notification :', error);
		throw error.response?.data || error;
	}
};

export const deleteNotifications = async (userId, notificationIds, token) => {
	try {
		const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
		const response = await api.delete('/notification/bulk', {
			...config,
			data: { userId, notificationIds },
		});
		return response.data;
	} catch (error) {
		console.error('Erreur lors de la suppression de plusieurs notifications :', error);
		throw error.response?.data || error;
	}
};

export const deleteAllNotifications = async (userId, token) => {
	try {
		const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
		const response = await api.delete(`/notification/all/${userId}`, config);
		return response.data;
	} catch (error) {
		console.error('Erreur lors de la suppression de toutes les notifications :', error);
		throw error.response?.data || error;
	}
};
