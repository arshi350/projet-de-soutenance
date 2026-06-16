import { useState, useEffect, useCallback } from 'react';
import * as templateService from '../services/templateService';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/templates';

export function useGetAllTemplates(token) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await templateService.getAllTemplates(token);
      const serverTemplates = res.templates || res;
      const templatesWithId = Array.isArray(serverTemplates)
        ? serverTemplates.map((t) => ({ ...t, id: t._id || t.id, _id: t._id || t.id }))
        : [];
      setTemplates(templatesWithId);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { templates, loading, error, refetch: fetch, setTemplates };
}

export function useGetTemplate(templateId, token) {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!templateId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await templateService.getTemplateById(templateId, token);
      const templateData = res.template || res;
      setTemplate({ ...templateData, id: templateData._id || templateData.id, _id: templateData._id || templateData.id });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [templateId, token]);

  useEffect(() => { fetch(); }, [fetch]);

  return { template, loading, error, refetch: fetch, setTemplate };
}

export function useCreateTemplate(token) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createTemplate = async (templateData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await templateService.addTemplate(templateData, token);
      const createdTemplate = res.template || res;
      return { ...createdTemplate, id: createdTemplate._id || createdTemplate.id, _id: createdTemplate._id || createdTemplate.id };
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createTemplate, loading, error };
}

export function useUpdateTemplate(token) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateTemplate = async (id, templateData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await templateService.updateTemplate(id, templateData, token);
      const updatedTemplate = res.template || res;
      return { ...updatedTemplate, id: updatedTemplate._id || updatedTemplate.id, _id: updatedTemplate._id || updatedTemplate.id };
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateTemplate, loading, error };
}

export function useDeleteTemplate(token) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteTemplate = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await templateService.deleteTemplate(id, token);
      return res;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteTemplate, loading, error };
}

// Hook utilitaire pour uploader une image via l'endpoint existant
export function useUploadTemplateImage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadImage = async (file) => {
    if (!file) throw new Error('No file provided');
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await axios.post(`${API_BASE}/uploadImage`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data.url;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { uploadImage, loading, error };
}

export default {
  useGetAllTemplates,
  useGetTemplate,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  useUploadTemplateImage,
};
