const MOCK_USERS = [
  { id: "1", name: "You", color: "hsl(230, 65%, 52%)" },
  { id: "2", name: "Alice", color: "hsl(262, 52%, 55%)" },
  { id: "3", name: "Bob", color: "hsl(152, 60%, 42%)" },
];

const PresenceAvatars = () => {
  return (
    <div className="flex items-center -space-x-2">
      {MOCK_USERS.map((user) => (
        <div
          key={user.id}
          className="w-7 h-7 rounded-full border-2 border-card flex items-center justify-center text-[10px] font-bold text-primary-foreground"
          style={{ background: user.color }}
          title={user.name}
        >
          {user.name[0]}
        </div>
      ))}
      <div className="pl-3 text-xs text-muted-foreground font-medium">
        {MOCK_USERS.length} online
      </div>
    </div>
  );
};

export default PresenceAvatars;