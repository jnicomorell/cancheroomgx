import React, { useState, useEffect } from 'react';
import { listFields } from '@/lib/api/fields';
import { Field } from '@/types';
import FieldCard from '@/components/FieldCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const FieldsPage: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [sport, setSport] = useState<string>('');
  const [price, setPrice] = useState<number>();
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const fetchFields = async () => {
      const data = await listFields({
        sport: sport || undefined,
        price,
        date: date || undefined,
      });
      setFields(data);
    };
    fetchFields();
  }, [sport, price, date]);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Canchas</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <Label>Deporte</Label>
          <Select value={sport} onValueChange={setSport}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="football">Fútbol</SelectItem>
              <SelectItem value="paddle">Padel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Precio máximo</Label>
          <Input
            type="number"
            value={price?.toString() || ''}
            onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Precio"
            className="mt-1"
          />
        </div>

        <div>
          <Label>Fecha</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      {fields.map((field) => (
        <FieldCard key={field.id} field={field} />
      ))}
    </div>
  );
};

export default FieldsPage;
