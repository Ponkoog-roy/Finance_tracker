const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import TransactionForm from '@/components/transactions/TransactionForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NewTransaction() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => db.entities.Account.list(),
  });

  const mutation = useMutation({
    mutationFn: (data) => db.entities.Transaction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      navigate('/transactions');
    },
  });

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-display font-bold">New Transaction</h1>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <TransactionForm
          accounts={accounts}
          onSubmit={mutation.mutate}
          isSubmitting={mutation.isPending}
        />
      </div>
    </div>
  );
}