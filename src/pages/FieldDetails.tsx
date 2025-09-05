import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getField } from '@/lib/api/fields';
import { Field } from '@/types';

const FieldDetails: React.FC = () => {
  const { fieldId } = useParams<{ fieldId: string }>();
  const [field, setField] = useState<Field | null>(null);

  useEffect(() => {
    if (!fieldId) return;
    const fetchField = async () => {
      const data = await getField(fieldId);
      setField(data);
    };
    fetchField();
  }, [fieldId]);

  if (!field) {
    return <div className="container mx-auto px-4 py-6">Cargando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">{field.name}</h1>
      <p className="mb-2">Deporte: {field.sport}</p>
      <p className="mb-2">Precio por hora: ${field.price_per_hour}</p>
    </div>
  );
};

export default FieldDetails;
