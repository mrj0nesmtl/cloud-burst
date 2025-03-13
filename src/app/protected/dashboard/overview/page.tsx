import React from 'react';

export default function OverviewPage() {
  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-4">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
          <p>Your recent activity will appear here.</p>
        </div>
        <div className="bg-card p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Upcoming Events</h2>
          <p>Your upcoming events will appear here.</p>
        </div>
        <div className="bg-card p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Quick Stats</h2>
          <p>Your statistics will appear here.</p>
        </div>
      </div>
    </div>
  );
}
