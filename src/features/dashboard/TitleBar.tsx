export const TitleBar = (props: {
  title: React.ReactNode;
  description?: React.ReactNode;
}) => {
  const finalDescription = props.description || 'Manage your leads and account';

  return (
    <div className="mb-8">
      <div className="text-2xl font-semibold">{props.title}</div>

      <div className="text-sm font-medium text-muted-foreground">
        {finalDescription}
      </div>
    </div>
  );
};
