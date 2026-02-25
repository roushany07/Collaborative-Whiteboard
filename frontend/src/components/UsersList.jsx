import { Users } from 'lucide-react';

export default function UsersList({ users }) {
  return (
    <div className="p-4 border-b-2 border-gray-300">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-5 h-5" />
        <h3 className="font-bold">Online Users ({users.length})</h3>
      </div>
      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.socketId} className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm">{user.userName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
