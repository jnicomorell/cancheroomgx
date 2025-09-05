import React from 'react';
import { Field } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface Props {
  field: Field;
}

const FieldCard: React.FC<Props> = ({ field }) => (
  <Card className="mb-4">
    <CardHeader>
      <CardTitle>{field.name}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm">Deporte: {field.sport}</p>
      <p className="text-sm">Precio: ${field.price_per_hour}</p>
      <Link to={`/fields/${field.id}`} className="text-blue-500 text-sm">
        Ver detalles
      </Link>
    </CardContent>
  </Card>
);

export default FieldCard;
