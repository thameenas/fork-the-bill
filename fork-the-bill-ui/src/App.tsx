import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import ReceiptUpload from './components/ReceiptUpload';
import ExpenseView from './components/ExpenseView';
import { Expense, Item } from './types';
import { getExpense, createExpense, updateExpenseItems, updateExpenseTaxTip, claimItem } from './api/expenses';

// Component to handle expense loading and display
const ExpensePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExpense = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const loadedExpense = await getExpense(id);
        setExpense(loadedExpense);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load expense');
      } finally {
        setLoading(false);
      }
    };

    loadExpense();
  }, [id]);

  const handleItemClaimed = async (itemId: string, personName: string) => {
    if (!expense) return;

    try {
      const updatedExpense = await claimItem(expense.id, itemId, personName);
      setExpense(updatedExpense);
    } catch (err) {
      console.error('Failed to claim item:', err);
      // Could show a toast notification here
    }
  };

  const handleItemsUpdated = async (updatedItems: Item[]) => {
    if (!expense) return;

    try {
      const updatedExpense = await updateExpenseItems(expense.id, updatedItems);
      setExpense(updatedExpense);
    } catch (err) {
      console.error('Failed to update items:', err);
    }
  };

  const handleTaxTipUpdated = async (tax: number, tip: number) => {
    if (!expense) return;

    try {
      const updatedExpense = await updateExpenseTaxTip(expense.id, tax, tip);
      setExpense(updatedExpense);
    } catch (err) {
      console.error('Failed to update tax/tip:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading expense...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Expense not found</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <ExpenseView 
      expense={expense} 
      onItemClaimed={handleItemClaimed}
      onItemsUpdated={handleItemsUpdated}
      onTaxTipUpdated={handleTaxTipUpdated}
    />
  );
};

// Component to handle expense creation
const CreateExpensePage: React.FC = () => {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  const handleExpenseCreated = async (expenseId: string) => {
    setCreating(true);
    // Use React Router navigation instead of window.location.href
    navigate(`/expense/${expenseId}`);
  };

  return (
    <ReceiptUpload onExpenseCreated={handleExpenseCreated} />
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 py-8">
        <Routes>
          <Route 
            path="/" 
            element={<CreateExpensePage />}
          />
          <Route 
            path="/expense/:id" 
            element={<ExpensePage />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
