import api from './api';

export const createAgent = async (agentData) => {
  const response = await api.post('/agent/create', agentData);
  return response.data;
};

export const getAgentsByEvent = async (eventId) => {
  const response = await api.get(`/agent/event/${eventId}`);
  return response.data;
};

export const sendAgentCredentials = async (agentId) => {
  const response = await api.post('/agent/send-credentials', { agentId });
  return response.data;
};

export const sendEventCodeToAgents = async (eventId, agentIds = []) => {
  const response = await api.post('/agent/send-event-code', { eventId, agentIds });
  return response.data;
};

export const deleteAgent = async (agentId) => {
  const response = await api.delete(`/agent/${agentId}`);
  return response.data;
};
