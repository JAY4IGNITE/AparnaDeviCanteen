import React from 'react';
import { Store } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';

const CounterSale = () => {
  return (
    <div>
      <PageHeader title="Counter Sale" subtitle="Manage and place direct counter sales" />

      <div className="card-static">
        <EmptyState
          icon={Store}
          title="Coming Soon"
          description="Counter sale interface will be implemented here."
        />
      </div>
    </div>
  );
};

export default CounterSale;
